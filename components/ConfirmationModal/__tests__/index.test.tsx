import ModalDisplay from "@/app/(main)/components/ModalDisplay";
import UiContextProvider, { useUiContext } from "@/contexts/UiContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLayoutEffect } from "react";
import ConfirmationModal from "..";

describe("ConfirmationModal", () => {
  describe("User Interaction", () => {
    it("should close when exit button is clicked", async () => {
      const Dispatcher = () => {
        const { addModal } = useUiContext();

        useLayoutEffect(() => {
          addModal(
            <ConfirmationModal title="Test" confirmCallback={() => null} />
          );
        }, []);

        return <div></div>;
      };

      render(
        <UiContextProvider>
          <Dispatcher />
          <ModalDisplay />
        </UiContextProvider>
      );

      const exitButton = screen.getByLabelText("Exit modal");
      const modal = screen.getByTestId("confirmation-modal");
      expect(modal).toBeInTheDocument();
      await userEvent.click(exitButton);
      expect(modal).not.toBeInTheDocument();
    });
  });
});
