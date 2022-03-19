import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create statement", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to create a deposit", async () => {
    const user = await usersRepository.create({
      name: "User Name",
      email: "user.name@server.com",
      password: "password",
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id || "",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "BRL 100 deposit",
    });

    expect(validate(deposit.id || "")).toBeTruthy();
    expect(deposit.user_id).toBe(user.id);
    expect(deposit.type).toBe(OperationType.DEPOSIT);
    expect(deposit.amount).toBe(100);
    expect(deposit.description).toBe("BRL 100 deposit");
  });
  it("should be able to create a withdraw", async () => {
    const user = await usersRepository.create({
      name: "User Name2",
      email: "user.name2@server.com",
      password: "password",
    });

    await createStatementUseCase.execute({
      user_id: user.id || "",
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "BRL 100 deposit",
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id || "",
      type: OperationType.WITHDRAW,
      amount: 50,
      description: "BRL 50 deposit",
    });

    expect(validate(withdraw.id || "")).toBeTruthy();
    expect(withdraw.user_id).toBe(user.id);
    expect(withdraw.type).toBe(OperationType.WITHDRAW);
    expect(withdraw.amount).toBe(50);
    expect(withdraw.description).toBe("BRL 50 deposit");
  });
  it("should not be able to create a withdraw without sufficient funds", () => {
    expect(async () => {
      const user = await usersRepository.create({
        name: "User Name3",
        email: "user.name3@server.com",
        password: "password",
      });

      await createStatementUseCase.execute({
        user_id: user.id || "",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "BRL 100 deposit",
      });

      const withdraw = await createStatementUseCase.execute({
        user_id: user.id || "",
        type: OperationType.WITHDRAW,
        amount: 101,
        description: "BRL 101 withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError)
  });
});
