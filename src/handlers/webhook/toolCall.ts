import { checkOrderStatus } from "../tools/checkOrderStatus";
import { ToolCall } from "../types/vapi.types";

/**
 * Handles tool call webhooks from Vapi
 * 
 * This function processes incoming tool call requests from the Vapi platform.
 * It extracts the tool calls from the payload, executes the appropriate tool
 * function based on the tool name, and returns the results in the expected format.
 * 
 * @param payload - The webhook payload containing tool calls to execute
 * @returns Promise containing the tool call results
 */
export const toolCallHandler = async (payload: any) => {
  const { toolCalls } = payload;

  const getToolCallResult = async () => {
    const toolCall: ToolCall = toolCalls[0];
    const {
      function: { name, arguments: toolCallparameters },
    } = toolCall;

    switch (name) {
      case "checkOrderStatus":
        return await checkOrderStatus({
          toolCallparameters,
        });
      default:
        throw new Error(`Function ${name} not found`);
    }
  };

  const result = await getToolCallResult();

  return {
    results: [
      {
        toolCallId: toolCalls[0].id,
        result: result,
      },
    ],
  };
};
