import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { validate } from "uuid";
import { CreateUserError } from "./CreateUserError";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create user", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user.name@server.com",
      password: "user password",
    });

    expect(validate(user.id || "")).toBeTruthy();
    expect(user.name).toBe("User Name");
    expect(user.email).toBe("user.name@server.com");
  });

  it("should not be able to create two user with the same e-mail", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "User Name",
        email: "same.user.name@server.com",
        password: "user password",
      });

      await createUserUseCase.execute({
        name: "Another User Name",
        email: "same.user.name@server.com",
        password: "user password",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
