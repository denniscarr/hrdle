extends Node

# In the future, it would be better if resources/params specific to the race were supplied by
# the web-side. The randomization here is just for safe-keeping.

## Horses will be selected at random. Must be at least _num_horses_in_race
@export var _horses: Array[HorseData]

## Race will be selected at random
@export var _race_scenes: Array[PackedScene]

@export var _num_horses_in_race: int = 7

var _race_track: RaceTrack

@onready var _cam := $RaceCamera as Camera2D


func _ready() -> void:
	# For debugging editor-side, just start with a random seed
	if not OS.has_feature("web"):
		_init_race(randi_range(0, 10000))
		return

	JSBridge.init_race_recieved.connect(_init_race)


func _init_race(rand_seed: int) -> void:
	seed(rand_seed)

	# Pick horses at random
	var horse_bag := _horses.duplicate()
	horse_bag.shuffle()
	var horses: Array[HorseData] = []
	for i: int in range(0, _num_horses_in_race):
		if horse_bag.size() == 0:
			push_warning("Too many horses!")
			break
		horses.push_back(horse_bag.pop_front())

	# Pick a race track at random
	_race_track = _race_scenes.pick_random().instantiate() as RaceTrack
	add_child(_race_track)

	_race_track.race_started.connect(_on_race_track_race_started)
	_race_track.race_over.connect(_on_race_track_race_over)

	_race_track.determ_rng.seed = rand_seed
	_race_track.set_race_cam(_cam)
	_race_track.initialize(horses)
	_race_track.start_countdown()

	# Reduce horse data into an web-compatible dict and send it to React
	var web_horse_datas: Array[Dictionary] = []
	web_horse_datas = horses.reduce(
		func(whd: Array[Dictionary], hd: HorseData):
			whd.push_back(JSBridge.format_horse_data_for_web(hd))
			return whd,
		web_horse_datas
	)

	JSBridge.send_to_js(JSBridge.MessageType.RACE_INITIALIZED, {"horseDatas": web_horse_datas})


func _input(event: InputEvent) -> void:
	# TODO: For some reason these key events aren't recieved on web.
	# Fix if debugging gets annoying.
	if _race_track != null and event is InputEventKey:
		if event.is_action_released("debug_skip"):
			match _race_track.current_state:
				# Allow skip countdown
				RaceTrack.State.COUNTDOWN:
					_race_track.start_race()
				# Allow skip race
				RaceTrack.State.RACE:
					_debug_skip_to_victory()


func _debug_skip_to_victory():
	# Pick a random winning horse
	var winner := _race_track.horses.pick_random() as Horse
	_race_track._winning_horse = winner

	# Force-set some things in the race track
	_race_track.get_node("RaceClock").start_counting = false
	_race_track.get_node("AudioStreamPlayer2D").stream = winner.horse_data.victory_theme
	_race_track.get_node("AudioStreamPlayer2D").play()

	winner.win()
	_race_track.goal_grabbed.emit(winner)

	# In a debug method, I hereby grant access to private members
	_race_track._start_victory()


func _on_race_track_race_started():
	JSBridge.send_to_js(JSBridge.MessageType.RACE_STARTED)


func _on_race_track_race_over():
	JSBridge.send_to_js(JSBridge.MessageType.RACE_ENDED)
