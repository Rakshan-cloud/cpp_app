"""Ticket routes -- view ticket details, serve QR images, and validate tickets."""

import os
import json

from flask import Blueprint, request, jsonify, current_app, g, send_file, redirect

from app.middleware.auth import token_required

tickets_bp = Blueprint("tickets", __name__, url_prefix="/api/tickets")


@tickets_bp.route("/<ticket_id>", methods=["GET"])
@token_required
def get_ticket(ticket_id):
    """Get ticket details for a given ticket ID."""
    try:
        ticket = current_app.dynamo_service.get_ticket(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404

        if ticket.get("user_id") != g.current_user["user_id"]:
            return jsonify({"error": "Access denied"}), 403

        qr_url = current_app.s3_service.get_qr_image_url(ticket_id)
        ticket["qr_url"] = qr_url

        return jsonify({"ticket": ticket}), 200

    except Exception as exc:
        return jsonify({"error": f"Failed to fetch ticket: {str(exc)}"}), 500


@tickets_bp.route("/<ticket_id>/qr", methods=["GET"])
def get_qr_image(ticket_id):
    """Serve the QR code image for a ticket."""
    try:
        local_path = current_app.s3_service.get_local_image_path(ticket_id)
        if local_path and os.path.isfile(local_path):
            return send_file(local_path, mimetype="image/png")

        presigned_url = current_app.s3_service.get_qr_image_url(ticket_id)
        if presigned_url:
            return redirect(presigned_url)

        return jsonify({"error": "QR code image not found"}), 404

    except Exception as exc:
        return jsonify({"error": f"Failed to serve QR image: {str(exc)}"}), 500


@tickets_bp.route("/validate", methods=["POST"])
def validate_ticket():
    """Validate QR code data.

    First tries Lambda, falls back to direct library validation.
    Expects JSON body with ``qr_data`` -- the raw string scanned from the QR code.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        qr_data = data.get("qr_data", "")
        if not qr_data:
            return jsonify({"error": "qr_data is required"}), 400

        # Try Lambda first, fall back to direct validation
        try:
            result = current_app.lambda_service.invoke_qr_validator({"qr_data": qr_data})
            status_code = result.get("statusCode", 500)
            body = result.get("body", {})
            if status_code < 500:
                return jsonify(body), status_code
        except Exception:
            pass

        # Fallback: validate directly using the library
        return _validate_directly(qr_data)

    except Exception as exc:
        return jsonify({"error": f"Validation failed: {str(exc)}"}), 500


def _validate_directly(qr_data):
    """Validate ticket directly using the qr_ticket_manager library."""
    try:
        from qr_ticket_manager import TicketValidator

        secret_key = current_app.config.get("TICKET_SECRET_KEY", "")
        validator = TicketValidator(secret_key)

        # Parse the QR data
        if isinstance(qr_data, str):
            qr_dict = json.loads(qr_data)
        else:
            qr_dict = qr_data

        ticket_id = qr_dict.get("ticket_id")
        payload = qr_dict.get("payload", {})
        signature = qr_dict.get("signature", "")

        # Layer 1: Verify HMAC signature
        try:
            validator.verify_signature(payload, signature)
        except Exception as sig_err:
            return jsonify({
                "valid": False,
                "error_code": "INVALID_SIGNATURE",
                "message": f"Invalid ticket signature: {str(sig_err)}",
            }), 400

        # Layer 2: Check ticket status in DynamoDB
        ticket = current_app.dynamo_service.get_ticket(ticket_id)
        if not ticket:
            return jsonify({
                "valid": False,
                "error_code": "TICKET_NOT_FOUND",
                "message": "Ticket not found in database",
            }), 404

        status = ticket.get("status", "unknown")

        if status == "used":
            return jsonify({
                "valid": False,
                "error_code": "TICKET_ALREADY_USED",
                "message": "This ticket has already been used",
                "ticket": {
                    "ticket_id": ticket_id,
                    "event_name": ticket.get("event_name", ""),
                    "status": status,
                    "used_at": ticket.get("used_at", ""),
                },
            }), 400

        if status == "revoked":
            return jsonify({
                "valid": False,
                "error_code": "TICKET_REVOKED",
                "message": "This ticket has been revoked",
                "ticket": {"ticket_id": ticket_id, "status": status},
            }), 400

        if status != "valid":
            return jsonify({
                "valid": False,
                "error_code": "INVALID_STATUS",
                "message": f"Ticket status is '{status}'",
                "ticket": {"ticket_id": ticket_id, "status": status},
            }), 400

        # Mark ticket as used
        from datetime import datetime, timezone
        used_at = datetime.now(timezone.utc).isoformat()
        current_app.dynamo_service.update_ticket_status(ticket_id, "used", used_at)

        # Mark registration as checked in
        reg_id = ticket.get("registration_id") or payload.get("registration_id")
        if reg_id:
            try:
                current_app.dynamo_service.update_registration(reg_id, {
                    "checked_in": True,
                    "checked_in_at": used_at,
                })
            except Exception:
                pass

        return jsonify({
            "valid": True,
            "message": "Ticket is valid - allow entry",
            "ticket": {
                "ticket_id": ticket_id,
                "event_name": ticket.get("event_name", payload.get("event_name", "")),
                "status": "used",
                "used_at": used_at,
            },
        }), 200

    except json.JSONDecodeError:
        return jsonify({
            "valid": False,
            "error_code": "INVALID_FORMAT",
            "message": "QR data is not valid JSON",
        }), 400
    except Exception as exc:
        return jsonify({
            "valid": False,
            "error_code": "VALIDATION_ERROR",
            "message": f"Validation error: {str(exc)}",
        }), 500
