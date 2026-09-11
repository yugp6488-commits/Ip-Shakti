# backend/app/legal_status.py
"""
Centralized compliance status enum and deterministic aggregation logic.

All legal analysis outputs must use these status values exclusively.
The LLM must NOT invent arbitrary status labels.
Overall status is computed deterministically by code, not by the LLM.
"""
from enum import Enum
from typing import List


class ComplianceStatus(str, Enum):
    """Allowed compliance status values for individual requirements."""
    PASS = "PASS"
    NO_DIRECT_CONFLICT = "NO_DIRECT_CONFLICT"
    ACTION_REQUIRED = "ACTION_REQUIRED"
    REGISTRATION_REQUIRED = "REGISTRATION_REQUIRED"
    PRIOR_INTIMATION_REQUIRED = "PRIOR_INTIMATION_REQUIRED"
    APPROVAL_REQUIRED = "APPROVAL_REQUIRED"
    EXEMPT = "EXEMPT"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    INSUFFICIENT_INFORMATION = "INSUFFICIENT_INFORMATION"


# Status sets for deterministic aggregation
_ACTION_STATUSES = {
    ComplianceStatus.ACTION_REQUIRED,
    ComplianceStatus.REGISTRATION_REQUIRED,
    ComplianceStatus.PRIOR_INTIMATION_REQUIRED,
    ComplianceStatus.APPROVAL_REQUIRED,
}

_CLEAR_STATUSES = {
    ComplianceStatus.PASS,
    ComplianceStatus.NO_DIRECT_CONFLICT,
    ComplianceStatus.EXEMPT,
    ComplianceStatus.NOT_APPLICABLE,
}

_REVIEW_STATUSES = {
    ComplianceStatus.REVIEW_REQUIRED,
    ComplianceStatus.INSUFFICIENT_INFORMATION,
}


def compute_overall_status(statuses: List[str]) -> str:
    """
    Deterministically compute the overall compliance status from individual
    requirement statuses.

    Priority order:
    1. Any ACTION-type status → overall ACTION_REQUIRED
    2. Any REVIEW-type status → overall REVIEW_REQUIRED
    3. All clear statuses → overall PASS

    Empty list → REVIEW_REQUIRED (no evaluation performed).
    """
    if not statuses:
        return ComplianceStatus.REVIEW_REQUIRED.value

    parsed = []
    for s in statuses:
        try:
            parsed.append(ComplianceStatus(s))
        except ValueError:
            # Unknown status from LLM — force review
            parsed.append(ComplianceStatus.REVIEW_REQUIRED)

    # Priority 1: any action-requiring status
    if any(s in _ACTION_STATUSES for s in parsed):
        return ComplianceStatus.ACTION_REQUIRED.value

    # Priority 2: any review-requiring status
    if any(s in _REVIEW_STATUSES for s in parsed):
        return ComplianceStatus.REVIEW_REQUIRED.value

    # Priority 3: all statuses are clear
    if all(s in _CLEAR_STATUSES for s in parsed):
        return ComplianceStatus.PASS.value

    # Fallback
    return ComplianceStatus.REVIEW_REQUIRED.value


def validate_status(status: str) -> str:
    """
    Validate a status string against the enum.
    Returns the canonical enum value if valid, otherwise REVIEW_REQUIRED.
    """
    try:
        return ComplianceStatus(status).value
    except ValueError:
        return ComplianceStatus.REVIEW_REQUIRED.value


# Mapping from status to UI appearance category for frontend consistency
STATUS_DISPLAY = {
    ComplianceStatus.PASS.value: {"color": "green", "label": "PASS"},
    ComplianceStatus.NO_DIRECT_CONFLICT.value: {"color": "green", "label": "NO DIRECT CONFLICT"},
    ComplianceStatus.ACTION_REQUIRED.value: {"color": "amber", "label": "ACTION REQUIRED"},
    ComplianceStatus.REGISTRATION_REQUIRED.value: {"color": "amber", "label": "REGISTRATION REQUIRED"},
    ComplianceStatus.PRIOR_INTIMATION_REQUIRED.value: {"color": "amber", "label": "PRIOR INTIMATION REQUIRED"},
    ComplianceStatus.APPROVAL_REQUIRED.value: {"color": "amber", "label": "APPROVAL REQUIRED"},
    ComplianceStatus.EXEMPT.value: {"color": "grey", "label": "EXEMPT"},
    ComplianceStatus.NOT_APPLICABLE.value: {"color": "grey", "label": "NOT APPLICABLE"},
    ComplianceStatus.REVIEW_REQUIRED.value: {"color": "amber", "label": "REVIEW REQUIRED"},
    ComplianceStatus.INSUFFICIENT_INFORMATION.value: {"color": "amber", "label": "INSUFFICIENT INFORMATION"},
}
