import { useEffect } from "react";
import type { Dispatch } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { PageHandle, PageId } from "@/types/profile";
import type {
  LayoutMutationContext,
  SaveLayoutVariables,
} from "@/service/layouts/layout-mutation-options";
import { toastManager } from "@/components/ui/toast";
import type { SaveStatus } from "@/components/profile/save-status-context";
import type {
  BlockEditorAction,
  BlockEditorState,
} from "./block-editor-reducer";

type BlockEditorControllerDeps = {
  saveLayoutMutation: UseMutationResult<
    void,
    Error,
    SaveLayoutVariables,
    LayoutMutationContext
  >;
  setStatus: (status: SaveStatus) => void;
  handle: PageHandle;
  pageId: PageId;
};

/**
 * BlockEditor 상태 변화를 감지해 자동 저장 사이드 이펙트를 수행한다.
 */
export const useBlockEditorController = (
  state: BlockEditorState,
  dispatch: Dispatch<BlockEditorAction>,
  deps: BlockEditorControllerDeps
) => {
  const { handle, pageId, saveLayoutMutation, setStatus } = deps;

  /**
   * saveState 변경에 따라 SaveStatusContext를 일원화해 갱신한다.
   */
  useEffect(() => {
    switch (state.saveState) {
      case "dirty":
        setStatus("dirty");
        break;
      case "saving":
        setStatus("saving");
        break;
      case "saved":
        setStatus("saved");
        break;
      case "error":
        setStatus("error");
        break;
      default:
        setStatus("idle");
        break;
    }
  }, [setStatus, state.saveState]);

  useEffect(() => {
    if (!state.pendingAutoSave) return;
    if (state.saveState === "saving") return;
    if (!state.latestLayout) return;

    const timer = setTimeout(() => {
      dispatch({ type: "AUTO_SAVE_START" });

      saveLayoutMutation.mutate(
        {
          layouts: state.latestLayout ?? [],
          handle,
          pageId,
        },
        {
          onSuccess: () => {
            dispatch({ type: "AUTO_SAVE_SUCCESS" });
          },
          onError: (error) => {
            dispatch({ type: "AUTO_SAVE_ERROR" });
            const message =
              error instanceof Error
                ? error.message
                : "레이아웃 저장에 실패했습니다.";
            toastManager.add({
              title: "레이아웃 저장 실패",
              description: message,
              type: "error",
            });
          },
        }
      );
    }, 600);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    handle,
    pageId,
    saveLayoutMutation,
    state.latestLayout,
    state.pendingAutoSave,
    state.saveState,
  ]);
};
