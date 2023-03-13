# Bubble architecture

How messages are sent from the client to the canvas:

1. event listener on `Room.timeline` calls `gameCommOnMatrixEvent` which in turn edits `Game.renderState`
2. in `renderState` for each user there's a single element which is a (message, timestamp) tuple
3. incoming messages reset that tuple, otherwise they render for 5000 milliseconds
