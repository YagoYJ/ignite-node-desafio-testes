import { hash } from "bcryptjs";
import { User } from "../../entities/User";

import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUserUseCase: ShowUserProfileUseCase;
let userDTO: ICreateUserDTO;
let user: User;

beforeEach(async () => {
  usersRepository = new InMemoryUsersRepository();
  showUserProfileUserUseCase = new ShowUserProfileUseCase(usersRepository);

  const password = await hash("password", 8);
  userDTO = {
    email: "user@example.com",
    name: "User Test",
    password,
  };

  user = await usersRepository.create(userDTO);
});

describe("Show User Profile Use Case", () => {
  it("Should be able to get user profile", async () => {
    const userResponse = await showUserProfileUserUseCase.execute(
      user.id || ""
    );

    expect(userResponse).toHaveProperty("email", "user@example.com");
  });

  it("Should not be able to get user profile with invalid id", async () => {
    await expect(
      showUserProfileUserUseCase.execute("invalid_user_id")
    ).rejects.toEqual(new ShowUserProfileError());
  });
});
