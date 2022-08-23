import mitt from 'mitt'

const emitter = mitt()

function useEmitter() {
  return {
    listen: (event: string, callback: Function) => {
      emitter.on(event, (data) => {
        console.log(event, data)
        if (data) {
          callback(data)
        }
      })
    },
    emit: (event: string, data: any = null) => {
      emitter.emit(event, data)
    },
  }
}

export default useEmitter
