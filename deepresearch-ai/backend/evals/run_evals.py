"""
LangSmith Evaluation Script for DeepResearch AI
Run this to grade the multi-agent graph's outputs against expected criteria.
"""

import os
import asyncio
from dotenv import load_dotenv
from langsmith import Client
from langsmith.evaluation import evaluate, LangChainStringEvaluator
from langchain_openai import ChatOpenAI

# 1. Setup Environment
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "deepresearch-evals"

client = Client()

# 2. Define Dataset
DATASET_NAME = "Research_Quality_Eval_Set"

# Create dataset if it doesn't exist
try:
    dataset = client.read_dataset(dataset_name=DATASET_NAME)
except:
    dataset = client.create_dataset(
        dataset_name=DATASET_NAME,
        description="Dataset for testing research report quality and citations."
    )
    
    # Add examples
    examples = [
        {
            "inputs": {"topic": "The impact of microplastics on human bloodstreams."},
            "outputs": {"expected_criteria": "Must mention recent Dutch studies finding microplastics in human blood, cite properly, and discuss methodological limitations."}
        },
        {
            "inputs": {"topic": "Quantum computing advances in factorization (Shor's algorithm)."},
            "outputs": {"expected_criteria": "Must explain Shor's algorithm, current practical qubit limits, and implications for RSA encryption."}
        }
    ]
    
    for ex in examples:
        client.create_example(
            inputs=ex["inputs"],
            outputs=ex["outputs"],
            dataset_id=dataset.id
        )

# 3. Define the pipeline to test
async def predict_research(inputs: dict) -> dict:
    """Wrapper around our graph for evaluation."""
    # Note: In a real eval, you would import run_graph, wait for its completion,
    # and fetch the final state from the DB or checkpointer.
    # For this script, we simulate the output returning a dummy report.
    print(f"Running pipeline for: {inputs['topic']}")
    await asyncio.sleep(2)
    
    mock_report = f"""
    # Research Report: {inputs['topic']}
    This is a generated report covering the topic. 
    It mentions Shor's algorithm and microplastics [1][2].
    """
    return {"final_report": mock_report}

# Sync wrapper for langsmith evaluate (if ainvoke is not used at top level)
def predict_sync(inputs: dict) -> dict:
    return asyncio.run(predict_research(inputs))

# 4. Define Evaluators
# We use a custom criteria evaluator powered by GPT-4o
eval_llm = ChatOpenAI(model="gpt-4o", temperature=0)

quality_evaluator = LangChainStringEvaluator(
    "labeled_criteria",
    config={
        "criteria": {
            "accuracy": "Does the response accurately address the topic based on the expected criteria?",
            "citations": "Does the response include bracketed citations like [1]?",
            "depth": "Is the response sufficiently detailed and technical?"
        },
        "llm": eval_llm
    }
)

# 5. Run Evaluation
if __name__ == "__main__":
    print(f"Starting evaluation on dataset: {DATASET_NAME}")
    
    results = evaluate(
        predict_sync,
        data=DATASET_NAME,
        evaluators=[quality_evaluator],
        experiment_prefix="Graph-Eval-v1",
        metadata={"version": "1.0.0", "model": "gpt-4o"}
    )
    
    print("\nEvaluation complete. View results at: https://smith.langchain.com")
