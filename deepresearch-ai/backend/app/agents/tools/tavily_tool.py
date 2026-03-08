from langchain_community.tools.tavily_search import TavilySearchResults
from app.config import get_settings
from app.agents.state import SearchResult
import asyncio

settings = get_settings()

async def search_web(query: str, max_results: int = 5) -> list[SearchResult]:
    tool = TavilySearchResults(max_results=max_results, tavily_api_key=settings.TAVILY_API_KEY)
    try:
        raw_results = await asyncio.to_thread(tool.invoke, {"query": query})
        
        parsed = []
        for r in raw_results:
            parsed.append(SearchResult(
                url=r.get("url", ""),
                title=r.get("title", "Unknown"),
                content=r.get("content", ""),
                source="web"
            ))
        return parsed
    except Exception as e:
        print(f"Tavily search failed for query '{query}': {e}")
        return []
