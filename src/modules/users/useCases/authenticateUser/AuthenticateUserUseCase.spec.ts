import { hash } from "bcryptjs";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let user: ICreateUserDTO;

beforeEach(async () => {
  usersRepository = new InMemoryUsersRepository();
  authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);

  const password = await hash("password", 8);
  user = {
    email: "user@example.com",
    name: "User Test",
    password,
  };

  await usersRepository.create(user);
});

describe("Authenticate User Use Case", () => {
  it("Should be able to authenticate a user", async () => {
    const authenticateResponse = await authenticateUserUseCase.execute({
      email: user.email,
      password: "password",
    });

    expect(authenticateResponse).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user with invalid email", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: "invalid@example.com",
        password: "password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to authenticate a user with invalid password", async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "invalid_password",
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
