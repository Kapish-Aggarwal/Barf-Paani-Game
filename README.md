# Barf-Paani: Freeze Tag Game 🎮

A 2D HTML5 Canvas-based multiplayer-style game where a player (the "freezer") chases bots and tries to freeze them all within a time limit. Bots can unfreeze each other, and random obstacles add dynamic gameplay.

## 🧠 Built Entirely Using Prompt Engineering

This project was created entirely through step-by-step prompting using ChatGPT. No manual code writing — every line of HTML, CSS, and JavaScript was generated via AI conversations and refined with feedback.

## 🚀 How to Play

* Select a difficulty (Easy / Medium / Hard).
* Use **Arrow keys** to move the red player circle.
* Freeze blue bots by touching them — they turn gray.
* Unfrozen bots try to unfreeze frozen ones.
* If you touch an obstacle:

  * You slow down for 10 seconds.
  * Bots get faster temporarily.
  * After 10 seconds, you become permanently slower and bots faster.
* Win by freezing all bots before time runs out.

## 📦 Features

* HTML5 Canvas for rendering
* Smooth player & bot animations
* Difficulty levels:

  * Easy: 5 minutes, slower bots
  * Medium: 3 minutes
  * Hard: 2 minutes, faster bots
* Dynamic speed boosts/penalties
* Randomly generated non-overlapping obstacles
* Victory & defeat messages with restart logic

## 🧠 Technologies Used

* **HTML5 + CSS3**: Structure & styling
* **JavaScript (Vanilla)**: Game engine and logic
* **Canvas API**: For drawing the game environment
* **Prompt Engineering**: All code was generated iteratively using ChatGPT by giving step-by-step natural language instructions.

## 🛠 Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/barf-paani-game.git
   cd barf-paani-game
   ```
2. Open `index.html` in your browser.

> Optionally push your own changes or deploy to GitHub Pages or Vercel.

## 💡 Prompt Engineering Process

Each module was built using conversational AI:

* First, a canvas setup prompt was given
* Then player/bot rendering
* Movement logic
* Collision detection
* Obstacle generation
* Game timer & end conditions
* Visual/UI polish

Prompts were like:

> *“Write JavaScript to move a player sprite on canvas using arrow keys. Player should not go outside canvas.”*

Each improvement was prompted and tested step-by-step.

## 🔮 Planned Improvements

* Touch controls for mobile
* Sound effects for freeze/unfreeze
* Multiple player support or local co-op
* Score tracking and leaderboard

## 🙌 Acknowledgements

Thanks to OpenAI’s ChatGPT for generating the full project using natural language instructions!

---
