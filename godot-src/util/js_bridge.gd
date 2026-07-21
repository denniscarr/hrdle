# Global name: JSBridge
extends Node

signal init_race_recieved(daily_seed: int)

## Messages that can be sent to the JS code
enum MessageType {
	RACE_INITIALIZED,
}

## Callbacks that can be recieved from the JS code
enum WebCallbackType {
	INIT_RACE,
}

const _MESSAGE_NAMES_BY_TYPE: Dictionary = {
	MessageType.RACE_INITIALIZED: "godot:race_initialized",
}

const _WEB_CALLBACKS_BY_NAME: Dictionary = {
	"godot:init_race": WebCallbackType.INIT_RACE,
}

var _web_callback_ref  # Keep a ref here to make sure the js bridge doesn't get GC'd


func _ready():
	if not OS.has_feature("web"):
		return

	_web_callback_ref = JavaScriptBridge.create_callback(_on_web_callback)
	var window = JavaScriptBridge.get_interface("window")
	var target_window = window.top if window.top else window
	target_window.godot_handler = _web_callback_ref
	target_window.console.log("Godot: registered godot_handler on top window")


func send_to_js(message_type, event_data: Dictionary = {}):
	var event_name: String = _MESSAGE_NAMES_BY_TYPE[message_type]
	print("Godot sending event: ", event_name)

	if not OS.has_feature("web"):
		print("Error. Web not found. Event aborted.")
		return

	var window = JavaScriptBridge.get_interface("window")
	var options = JavaScriptBridge.create_object("Object")
	options["detail"] = JSON.stringify(event_data)
	var event = JavaScriptBridge.create_object("CustomEvent", event_name, options)
	window.dispatchEvent(event)


func _on_web_callback(args: Array):
	if not _WEB_CALLBACKS_BY_NAME.has(args[0]):
		print("Recieved unrecognized web callback: %s" % args[0])
		return

	var callback = _WEB_CALLBACKS_BY_NAME[args[0]]

	match callback:
		# When the page is loaded, this passes data for the daily game
		WebCallbackType.INIT_RACE:
			var daily_seed := args[1] as String
			init_race_recieved.emit(daily_seed.hash())
