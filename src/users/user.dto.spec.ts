import { validate } from "class-validator";
import { RegisterDto, LoginDto, UpdateUserDto } from "./user.dto";

describe("User DTOs", () => {
  describe("RegisterDto", () => {
    it("should validate successfully with correct data", async () => {
      const dto = new RegisterDto();
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.documentId = "16475414093";
      dto.password = "password123";
      dto.email = "john.doe@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with empty firstName", async () => {
      const dto = new RegisterDto();
      dto.firstName = "";
      dto.lastName = "Doe";
      dto.documentId = "16475414093";
      dto.password = "password123";
      dto.email = "john.doe@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail validation with empty lastName", async () => {
      const dto = new RegisterDto();
      dto.firstName = "John";
      dto.lastName = "";
      dto.documentId = "16475414093";
      dto.password = "password123";
      dto.email = "john.doe@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail validation with invalid documentId", async () => {
      const dto = new RegisterDto();
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.documentId = "invalid-cpf";
      dto.password = "password123";
      dto.email = "john.doe@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail validation with short password", async () => {
      const dto = new RegisterDto();
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.documentId = "16475414093";
      dto.password = "short";
      dto.email = "john.doe@example.com";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it("should fail validation with invalid email", async () => {
      const dto = new RegisterDto();
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.documentId = "16475414093";
      dto.password = "password123";
      dto.email = "invalid-email";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("LoginDto", () => {
    it("should validate successfully with correct data", async () => {
      const dto = new LoginDto();
      dto.email = "john.doe@example.com";
      dto.password = "password123";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with incorrect data", async () => {
      const dto = new LoginDto();
      dto.email = "invalid-email";
      dto.password = "short";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe("UpdateUserDto", () => {
    it("should validate successfully with correct data", async () => {
      const dto = new UpdateUserDto();
      dto.email = "john.doe@example.com";
      dto.password = "password123";

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it("should fail validation with incorrect data", async () => {
      const dto = new UpdateUserDto();
      dto.email = "invalid-email";
      dto.password = "short";

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
