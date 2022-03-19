import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get statement operation", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
  });

  it("should be able to get statement operation", async () => {
    const user = await usersRepository.create({
      name: "User Name",
      email: "user.name@server.com",
      password: "user password",
    });
    const statement = await statementsRepository.create({
      user_id: user.id || "",
      description: "BRL 100 deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    });
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id || "",
      statement_id: statement.id || "",
    });

    expect(validate(statement.id || '')).toBeTruthy();
    expect(statement.user_id).toBe(user.id);
    expect(statement.description).toBe('BRL 100 deposit');
    expect(statement.amount).toBe(100);
    expect(statement.type).toBe(OperationType.DEPOSIT);
  });
});
