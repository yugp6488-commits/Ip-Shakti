from typing import List, Dict, Any, TypedDict, Optional
from pydantic import BaseModel, Field, constr, AnyHttpUrl
from datetime import date

from app.legal_status import ComplianceStatus

# Input payload for /api/v1/analyze
class ComplianceRequest(BaseModel):
    formulation_name: str = "Untitled formulation"
    # Enforce at least 1 and at most 50 ingredients, each between 2 and 100 characters.
    ingredients: List[constr(min_length=2, max_length=100, strip_whitespace=True)] = Field(..., min_items=1, max_items=50)
    user_persona: str = "innovator"
    product_category: str = "proprietary_drug"
    biological_source: str = "cultivated_farm"
    jurisdiction: str = "domestic"
    has_patent: bool
    is_foreign_entity: bool
    query: str = ""
    # Extended optional fields for granular legal analysis
    is_foreign_controlled: Optional[bool] = None
    resource_accessed_from_india: Optional[bool] = None
    involves_traditional_knowledge: Optional[bool] = None
    is_codified_tk: Optional[bool] = None
    is_cultivated_medicinal_plant: Optional[bool] = None
    has_certificate_of_origin: Optional[bool] = None
    purpose: Optional[str] = None  # "research", "commercial", "ipr", "commercialisation"
    ipr_filed: Optional[bool] = None
    ipr_granted: Optional[bool] = None
    plans_commercialisation: Optional[bool] = None
    access_state: Optional[str] = None  # Indian state from which resource is accessed

# Input payload for /api/v1/crawl-gazette
class CrawlRequest(BaseModel):
    url: AnyHttpUrl
    source_title: constr(min_length=3, max_length=200, strip_whitespace=True)

class LegalClaim(BaseModel):
    claim: str
    evidence_ids: List[str]

class LegalVerdict(BaseModel):
    status: str
    required_nba_forms: List[str]
    legal_reasoning: str
    claims: List[LegalClaim] = []
    assessment_status: str = "NEEDS_REVIEW"
    risk_level: str = "UNKNOWN"


# ========================================================================
# Structured Compliance Analysis Response (new structured output format)
# ========================================================================

class SourceCitation(BaseModel):
    """A single source citation supporting a legal requirement analysis."""
    source_id: str = ""
    title: str = ""
    section: str = ""
    authority: str = ""
    retrieved_text: str = ""
    url: str = ""

class RequirementAnalysis(BaseModel):
    """Analysis result for a single statutory requirement."""
    id: str
    category: str  # "PATENT", "BIODIVERSITY", "AYUSH", etc.
    law: str
    section: str
    title: str
    status: str  # Must be a ComplianceStatus value
    detail: str = ""
    next_step: str = ""
    reason: str = ""
    evidence_ids: List[str] = []
    sources: List[SourceCitation] = []

class MissingInformation(BaseModel):
    """A fact that is needed to complete the legal analysis but was not provided."""
    field: str
    question: str
    why_needed: str = ""

class LegalBasis(BaseModel):
    """Metadata identifying which legal framework version is being applied."""
    jurisdiction: str = "India"
    as_of_date: str = ""
    framework: List[str] = []

class AnalysisSummary(BaseModel):
    """High-level summary of the compliance analysis."""
    overall_status: str  # Computed deterministically by code, not LLM
    title: str = "IP & Biodiversity Compliance Assessment"
    summary: str = ""

class ComplianceAnalysisResponse(BaseModel):
    """
    The full structured JSON envelope returned by the /api/v1/analyze endpoint.
    This replaces the old free-text verdict format.
    """
    analysis_summary: AnalysisSummary
    requirements: List[RequirementAnalysis] = []
    missing_information: List[MissingInformation] = []
    legal_disclaimer: str = (
        "AI-assisted compliance guidance based on retrieved authoritative sources. "
        "It is not a final legal opinion, statutory approval, or patentability determination."
    )
    legal_basis: LegalBasis = LegalBasis()
    # Backward compatibility fields — old clients can still find these
    status: str = ""
    verdict: str = ""
    compliance_verdict: str = ""
    legal_reasoning: str = ""
    statutory_reasoning: str = ""
    risk_analysis: List[Dict[str, Any]] = []
    next_steps: List[str] = []
    required_nba_forms: List[str] = []
    assessment_status: str = "NEEDS_REVIEW"
    risk_level: str = "UNKNOWN"
    claims: List[Dict[str, Any]] = []


# Shared state updated by LangGraph nodes
class AgentState(TypedDict):
    request: ComplianceRequest
    botanical_context: str
    legal_context: str
    retrieved_evidence_ids: List[str]
    evidence_dict: Dict[str, str]
    verdict: Dict[str, Any]