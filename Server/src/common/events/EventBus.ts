import { EventEmitter } from "events";


class EventBus extends EventEmitter {

    publish<T>(
        event: string,
        data: T
    ) {
        this.emit(event, data);
    }


    subscribe<T>(
        event: string,
        listener: (data: T) => void
    ) {
        this.on(event, listener);
    }
}


export default new EventBus();