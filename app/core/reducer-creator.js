import { format } from 'util';
import Debug from 'debug';
import Config from '../global.config';
import MD5 from 'md5';

const debug = Debug('Core:ReducerCreator');

const defaultConfiguration = {
  timeout: Config.Request.Timeout
};

//TODO: 다수의 액션을 하나의 리듀서가 처리할 수 있는 구조 구현
export default function(actionName, handler) {
  let Reducer = function(data, subscriber) {
    this._timestamp = Date.now();
    this._id = MD5(actionName.toLowerCase()+this._timestamp);
    this.subscriber = subscriber;
    this.useraction(data);
    this.addAction(this._id);
  };

  Reducer.actionName = actionName;

  let fn = Reducer.prototype;

  fn.useraction = handler;

  fn.id = () => this._id;
  fn.createtime = () => this._timestamp;
  fn.addAction = (id) => global.woowa.addAction(id);
  fn.removeAction = (id) => global.woowa.removeAction(id);

  fn.getData = function(url, settings) {
    if (typeof url === 'object') {
      settings = Object.assign(defaultConfiguration, url);
    } else {
      settings = Object.assign(defaultConfiguration, settings);
      settings.url = url;
    }

    let success = this.onSuccess || this.success;
    let fail = this.onFail || this.fail;

    $.get(settings)
      .done(success.bind(this))
      .fail(fail.bind(this));
  };

  fn.putData = function(url, settings) {

  };

  fn.postData = function(url, settings) {

  };

  fn.deleteData = function(url, settings) {

  };
  
  fn.success = function(data) {
    debug(data);
  };

  fn.fail = function(request, error) {
    request.abort();

    this.removeAction(this._id);
    this.addError(error);
  };

  fn.finish = function(data, options) {
    options = options || null;

    this.subscriber.call(this, data, options);
    this.removeAction(this._id);
  };

  return Reducer;
}