# Trainchain Miner

This project, Trainchain Miner is a Node.js application designed for blockchain mining simulation It connects to a Trainchain Node via Socket.IO to recieve mining tasks, which get solved by mutliple worker processes that try to find valid hashes according to the difficulty.

## Features

- Connects to a Trainchain Node using Socket.IO
- Dynammically adjusts the number of worker threads based on user input
- Simulates the mining process by finding hashes that meet the difficulty target

### Getting Started

### Prerequisites

- Node.js installed on your machine
- Access to a terminal or command line interface

### Installation

1. Clone the repository to your local machine.
2. Navigate to the project repository
3. install the necessary dependencies by running:

```sh
npm install
```

### Usage

To start the miner, run:

```sh
npm start
```

You will be prompted to enter the number of threads to run. The default is set to the maximum number of CPUs available on your machine.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
