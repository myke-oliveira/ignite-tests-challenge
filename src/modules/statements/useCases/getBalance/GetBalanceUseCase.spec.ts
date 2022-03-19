import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get balance", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });
  it("should be able to get balance", async () => {
    const user = await usersRepository.create({
      name: "User Name",
      email: "user.name@server.com",
      password: "user password",
    });

    statementsRepository.create({
      user_id: user.id || '',
      description: "BRL 100 deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    });

    statementsRepository.create({
      user_id: user.id || "",
      description: "BRL 200 deposit",
      amount: 200,
      type: OperationType.DEPOSIT,
    });

    statementsRepository.create({
      user_id: user.id || "",
      description: "BRL 150 withdraw",
      amount: 150,
      type: OperationType.WITHDRAW,
    });

    const { balance } = await getBalanceUseCase.execute({ user_id: user.id || "" });

    expect(balance).toBe(150);
  });
});
