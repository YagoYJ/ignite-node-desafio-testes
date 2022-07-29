import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { User } from "../../../users/entities/User";
import { OperationType } from "../../entities/Statement";

import { CreateStatementError } from "./CreateStatementError";

let createStatementUseCase: CreateStatementUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let user: User;

beforeEach(async () => {
  usersRepository = new InMemoryUsersRepository();
  statementsRepository = new InMemoryStatementsRepository();
  createStatementUseCase = new CreateStatementUseCase(
    usersRepository,
    statementsRepository
  );

  user = await usersRepository.create({
    email: "user@test.com",
    name: "User Test",
    password: "123123",
  });
});

describe("Create Statement Use Case", () => {
  it("Should be able to create a statement", async () => {
    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "Statement description test",
      type: OperationType.DEPOSIT,
      user_id: user?.id || "",
    });

    expect(statement).toHaveProperty("id");
  });

  it("Should not be able to create a statement with unsufficient amount", async () => {
    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "Statement description test",
        type: OperationType.DEPOSIT,
        user_id: "user_unxistent",
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("Should not be able to create a statement with a unexistent balance", async () => {
    await expect(
      createStatementUseCase.execute({
        amount: 100,
        description: "Statement description test",
        type: OperationType.WITHDRAW,
        user_id: user.id || "",
      })
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
