import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "..";

describe("Input", () => {
  describe("Rendering", () => {
    it("should render errors", () => {
      const view = render(<Input type="text" error="An error occurred" />);

      const errorText = screen.getByText(/An error occurred/);
      expect(errorText).toBeInTheDocument();
    });

    it("should render success messages", () => {
      const view = render(
        <Input type="text" successMessage="Successfully sumbitted" />,
      );

      const errorText = screen.getByText(/Successfully sumbitted/);
      expect(errorText).toBeInTheDocument();
    });

    it("should pass attribute props to input", () => {
      const view = render(
        <Input
          type="text"
          placeholder="Write here"
          aria-label="Aria Label"
          name="some-name"
        />,
      );
      const inputElement = screen.getByTestId(
        "input-element",
      ) as HTMLInputElement;

      expect(inputElement.placeholder).toBe("Write here");
      expect(inputElement).toHaveAttribute("aria-label", "Aria Label");
      expect(inputElement.name).toBe("some-name");
    });
  });

  describe("User Interaction", () => {
    it("should toggle password visibilty when show-password button is clicked", async () => {
      const { getByLabelText } = render(
        <Input type="password" placeholder="Password" />,
      );
      const input = screen.getByTestId("input-element") as HTMLInputElement;
      const togglePasswordButton = screen.getByLabelText(
        /^(Hide|Show) password$/,
      );

      expect(input.type).toBe("password");

      await userEvent.click(togglePasswordButton);
      expect(input.type).toBe("text");

      await userEvent.click(togglePasswordButton);
      expect(input.type).toBe("password");
    });
  });
});
