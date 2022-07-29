import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { User } from "../../../users/entities/User";
import { OperationType, Statement } from "../../entities/Statement";
import { GetStatementOperationError } from "./GetStatementOperationError";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let user: User;
let statement: Statement;

beforeEach(async () => {
  usersRepository = new InMemoryUsersRepository();
  statementsRepository = new InMemoryStatementsRepository();
  getStatementOperationUseCase = new GetStatementOperationUseCase(
    usersRepository,
    statementsRepository
  );

  user = await usersRepository.create({
    email: "user@test.com",
    name: "User Test",
    password: "123123",
  });

  statement = await statementsRepository.create({
    amount: 100,
    description: "Test description",
    type: OperationType.DEPOSIT,
    user_id: user.id || "",
  });
});

describe("Get Statement Operation Use Case", () => {
  it("Should be able to get a statement operation", async () => {
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id || "",
      statement_id: statement.id || "",
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should not be able to get a statement operation with a invalid statement id", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id || "",
        statement_id: "invalid_id",
      })
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it("Should not be able to get a statement operation with a invalid user id", async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: "invalid_id",
        statement_id: statement.id || "",
      })
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });
});
