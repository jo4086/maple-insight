export type ScreenshotCaptureResult = {
  path: string
  capturedAt: string
}

export type ScreenshotCaptureEvent =
  | { status: 'success'; result: ScreenshotCaptureResult }
  | { status: 'failed'; message: string }
