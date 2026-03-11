import sys
import os

# Add project root to path
backend_dir = r"d:\Research.io\deepresearch-ai\backend"
sys.path.append(backend_dir)
os.chdir(backend_dir)

print("--- START DIAGNOSTIC ---")

try:
    print("Testing app.agents.graph import...")
    from app.agents.graph import run_graph
    print("✅ app.agents.graph import successful")
except Exception as e:
    print(f"❌ app.agents.graph import failed: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()

print("--- END DIAGNOSTIC ---")
