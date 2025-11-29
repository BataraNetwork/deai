import json
import os
import threading
import time
import websocket
from ..tasks import generate_text_task

ws_client = None

def on_message(ws, message):
    try:
        msg = json.loads(message)
        if msg.get("type") == "route_inference":
            request_id = msg.get("requestId")
            payload = msg.get("payload", {})
            prompt = payload.get("prompt")
            model_name = payload.get("model_id", "gemma")

            if not prompt or not request_id:
                print("Missing prompt or request ID in inference request.")
                return

            print(f"Received inference request {request_id} for model {model_name}.")

            task = generate_text_task.delay(prompt, model_name, {})
            result_payload = task.get(timeout=120)

            response = {
                "type": "inference_result",
                "requestId": request_id,
                "payload": result_payload,
            }
            ws.send(json.dumps(response))
            print(f"Sent inference result for request {request_id}.")

    except Exception as e:
        print(f"Error processing message: {e}")

def on_error(ws, error):
    print(f"WebSocket Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("WebSocket connection closed. Reconnecting...")
    time.sleep(5)
    connect_websocket()

def on_open(ws):
    print("WebSocket connection to gateway opened.")
    def send_metrics():
        while True:
            try:
                metrics = {
                    "type": "metrics",
                    "score": 0.95, 
                    "load": 0.1
                }
                if ws.sock and ws.sock.connected:
                    ws.send(json.dumps(metrics))
                else:
                    break
                time.sleep(10)
            except Exception as e:
                print(f"Error sending metrics: {e}")
                break
    threading.Thread(target=send_metrics, daemon=True).start()

def connect_websocket():
    global ws_client
    gateway_url = os.getenv("GATEWAY_WEBSOCKET_URL", "ws://localhost:3000")
    ws_client = websocket.WebSocketApp(
        gateway_url,
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close
    )
    wst = threading.Thread(target=ws_client.run_forever)
    wst.daemon = True
    wst.start()
