extends Node

@export var _horses: Array[HorseData]
@export var _race_scenes: Array[PackedScene]
@export var _num_horses_in_race: int = 7

var _race_track: RaceTrack

@onready var _cam := $Camera2D as Camera2D


func _ready() -> void:
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

	_race_track.set_race_cam(_cam)
	_race_track.initialize(horses)
	_race_track.start_countdown()


func _input(event: InputEvent) -> void:
	# Allow skip countdown
	if _race_track != null and _race_track.current_state == RaceTrack.State.COUNTDOWN:
		if event is InputEventKey:
			var e := event as InputEventKey
			if e.keycode == KEY_SPACE:
				_race_track.start_race()
