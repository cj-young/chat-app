import { render, screen } from "@testing-library/react";
import LoaderButton from "..";

describe("LoaderButton", () => {
  it("should render children", () => {
    render(
      <LoaderButton loading={false}>
        <div>
          <p>Text Inside</p>
        </div>
      </LoaderButton>
    );

    const text = screen.getByText("Text Inside");
    expect(text).toBeInTheDocument();
  });

  it("should render spinner overlay when loading", () => {
    render(<LoaderButton loading={true}>Press Me</LoaderButton>);

    const overlay = screen.getByTestId("loader-overlay");
    expect(overlay).toBeInTheDocument();
  });

  it("should not render spinner overlay when not loading", () => {
    render(<LoaderButton loading={false}>Press Me</LoaderButton>);

    const overlay = screen.queryByTestId("loader-overlay");
    expect(overlay).not.toBeInTheDocument();
  });
});
