use rusty_v8 as v8;

pub struct Object {

}

impl Object {
    fn new_object() -> Object {
        v8::Object::new(scope)
    }
}