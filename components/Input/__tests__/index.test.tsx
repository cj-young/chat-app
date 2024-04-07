import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "..";

describe("Input", () => {
  describe("Rendering", () => {
    it("should render errors", () => {
      const input = render(<Input type="text" error="An error occurred" />);

      const errorText = input.getByText(/An error occurred/);
      expect(errorText).toBeInTheDocument();
    });

    it("should render success messages", () => {
      const input = render(
        <Input type="text" successMessage="Successfully sumbitted" />
      );

      const errorText = input.getByText(/Successfully sumbitted/);
      expect(errorText).toBeInTheDocument();
    });

    it("should pass attribute props to input", () => {
      const input = render(
        <Input
          type="text"
          placeholder="Write here"
          aria-label="Aria Label"
          name="some-name"
        />
      );
      const inputElement = input.getByTestId(
        "input-element"
      ) as HTMLInputElement;

      expect(inputElement.placeholder).toBe("Write here");
      expect(inputElement.getAttribute("aria-label")).toBe("Aria Label");
      expect(inputElement.name).toBe("some-name");
    });
  });

  describe("User Interaction", () => {
    it("should toggle password visibilty when show-password button is clicked", async () => {
      const { getByLabelText } = render(
        <Input type="password" placeholder="Password" />
      );
      const input = screen.getByTestId("input-element") as HTMLInputElement;
      const togglePasswordButton = getByLabelText(/^(Hide|Show) password$/);

      expect(input.type).toBe("password");

      await userEvent.click(togglePasswordButton);
      expect(input.type).toBe("text");

      await userEvent.click(togglePasswordButton);
      expect(input.type).toBe("password");
    });
  });
});
