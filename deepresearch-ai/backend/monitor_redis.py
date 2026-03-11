import redis
import json
import time

r = redis.from_url("redis://localhost:6379", decode_responses=True)
p = r.pubsub()
p.psubscribe("research:*:events")

print("Listening for research events... (Press Ctrl+C to stop)")
try:
    while True:
        message = p.get_message()
        if message and message['type'] == 'pmessage':
            print(f"Channel: {message['channel']}")
            print(f"Data: {message['data']}")
        time.sleep(0.5)
except KeyboardInterrupt:
    print("Stopped.")
