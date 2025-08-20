import ChessGame from "./core/game";

function main() {
  const body = document.querySelector("body")!;
  const options = {
    label: false,
    theme: {
      w: "#EBECD0",
      b: "#779556"
    },
  }
  const newboard = new ChessGame(520, 520, options);
  body.appendChild(newboard)
}


main()
