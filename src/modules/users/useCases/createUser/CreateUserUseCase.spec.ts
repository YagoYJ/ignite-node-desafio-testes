import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

beforeEach(() => {
  usersRepository = new InMemoryUsersRepository();
  createUserUseCase = new CreateUserUseCase(usersRepository);
});

describe("Create User Use Cas", () => {
  it("Shold be able to create a user", async () => {
    const password = await hash("senha", 8);

    const user = await createUserUseCase.execute({
      email: "user@example.com",
      name: "User Test",
      password,
    });

    expect(user).toHaveProperty("id");
  });

  it("Shold be able to create an user already existent", async () => {
    const password = await hash("senha", 8);
    const userPayload = {
      email: "user@example.com",
      name: "User Test",
      password,
    };

    await createUserUseCase.execute(userPayload);

    await expect(createUserUseCase.execute(userPayload)).rejects.toEqual(
      new CreateUserError()
    );
  });
});
