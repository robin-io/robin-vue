import { vi } from 'vitest'

export const makeContextMock = (
  partialMock: Partial<WebGLRenderingContext> = {}
): WebGLRenderingContext => {
  const context: Partial<WebGLRenderingContext> = {
    attachShader: vi.fn(),
    blendFuncSeparate: vi.fn(),
    bindBuffer: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    createShader: vi.fn().mockReturnValue({}),
    createProgram: vi.fn().mockReturnValue({}),
    createBuffer: vi.fn().mockReturnValue([]),
    compileShader: vi.fn(),
    drawArrays: vi.fn(),
    drawImage: vi.fn(),
    enable: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    getShaderParameter: vi.fn().mockReturnValue(1),
    getProgramParameter: vi.fn().mockReturnValue({}),
    getUniformLocation: vi.fn().mockReturnValue({}),
    getAttribLocation: vi.fn().mockReturnValue({}),
    linkProgram: vi.fn(),
    shaderSource: vi.fn(),
    uniformMatrix3fv: vi.fn(),
    uniform1i: vi.fn(),
    uniform2f: vi.fn(),
    useProgram: vi.fn(),
    vertexAttribPointer: vi.fn(),
    viewport: vi.fn(),

    // @ts-ignore
    canvas: {
      width: 1000,
      height: 1000
    },
    ...partialMock
  }

  return context as WebGLRenderingContext
}

export function __setManuelGlobals () {
  global.fetch = vi.fn().mockImplementation(() => {
    return Promise.resolve({
      blob () {
        return Promise.resolve({ size: 1024, type: 'image/jpeg' })
      }
    })
  })

  const CANVAS = global.HTMLCanvasElement

  CANVAS.prototype.toDataURL = vi.fn(() => 'image/jpeg')

  CANVAS.prototype.getContext = vi.fn().mockReturnValue(makeContextMock())
}
