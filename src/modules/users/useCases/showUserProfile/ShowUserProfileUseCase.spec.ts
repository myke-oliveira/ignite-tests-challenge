import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  it("should be able to show user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "User Name",
      email: "user.name@server.com",
      password: "user password",
    });

    const profile = await showUserProfileUseCase.execute(user.id || "");

    expect(profile.id).toBe(user.id);
    expect(profile.name).toBe("User Name");
    expect(profile.email).toBe("user.name@server.com");
    expect(compare(profile.password, "user password")).toBeTruthy();
  });
});
