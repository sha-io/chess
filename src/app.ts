import ChessGame from "./core/game";

function main() {
  const body = document.querySelector("body")!;
  const newboard = new ChessGame(520, 520);
  body.appendChild(newboard)
}


main()
