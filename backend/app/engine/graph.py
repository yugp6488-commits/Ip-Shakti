from langgraph.graph import StateGraph, END
from app.schemas import AgentState
from app.engine.nodes import botanical_lookup_node, legal_retrieval_node, llm_reasoning_node

workflow = StateGraph(AgentState)

# Register graph nodes
workflow.add_node("BotanicalLookup", botanical_lookup_node)
workflow.add_node("LegalLookup", legal_retrieval_node)
workflow.add_node("LLMReasoning", llm_reasoning_node)

# Define execution sequence
workflow.set_entry_point("BotanicalLookup")
workflow.add_edge("BotanicalLookup", "LegalLookup")
workflow.add_edge("LegalLookup", "LLMReasoning")
workflow.add_edge("LLMReasoning", END)

# Compile the runnable agent graph
compliance_agent = workflow.compile()