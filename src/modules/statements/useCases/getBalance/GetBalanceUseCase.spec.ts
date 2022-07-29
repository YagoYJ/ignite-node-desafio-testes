import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { User } from "../../../users/entities/User";
import { GetBalanceError } from "./GetBalanceError";
import { OperationType } from "../../entities/Statement";

let getBalanceUseCase: GetBalanceUseCase;

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let user: User;

beforeEach(async () => {
  usersRepository = new InMemoryUsersRepository();
  statementsRepository = new InMemoryStatementsRepository();
  getBalanceUseCase = new GetBalanceUseCase(
    statementsRepository,
    usersRepository
  );

  user = await usersRepository.create({
    email: "user@test.com",
    name: "User Test",
    password: "123123",
  });

  await statementsRepository.create({
    amount: 100,
    description: "Test DEPOSIT description",
    type: OperationType.DEPOSIT,
    user_id: user.id || "",
  });

  await statementsRepository.create({
    amount: 100,
    description: "Test WITHDRAW description",
    type: OperationType.WITHDRAW,
    user_id: user.id || "",
  });
});

describe("Get Balance Use Case", () => {
  it("Should be able get balance", async () => {
    const userExist = await usersRepository.findById(user.id || "");

    if (userExist?.id) {
      const balance = await getBalanceUseCase.execute({
        user_id: userExist.id,
      });

      expect(balance).toHaveProperty("statement");
    }
  });

  it("Should not be able get balance with a unexistent user", async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: "unexistent_user",
      })
    ).rejects.toEqual(new GetBalanceError());
  });
});
