import React from 'react';
import { render } from 'react-dom';
// import shakePhone from './shakePhone';

// eslint-disable-next-line
class Item extends React.PureComponent {
  state = {
    hover: false,
  };

  handleOnMouseEnter = () => {
    this.setState({
      hover: true,
    });
  };

  handleOnMouseLeave = () => {
    this.setState({
      hover: false,
    });
  };

  render() {
    const { num, time, name, selected, onClick } = this.props;
    const { hover } = this.state;

    return (
      <div
        onClick={onClick}
        onTouchEnd={onClick}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        style={{
          cursor: 'pointer',
          paddingLeft: '10px',
          height: '40px',
          lineHeight: '40px',
          borderBottom: '1px solid rgba(0,0,0,0.3)',
          // eslint-disable-next-line
          backgroundColor: hover
            ? 'rgba(255,255,255,0.03)'
            : selected
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(255,255,255,0)',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            marginRight: '8px',
            color: 'rgba(255,255,255, 0.3)',
          }}
        >
          {num + 1}
        </span>
        <span
          style={{
            fontSize: '11px',
            marginRight: '8px',
            color: 'rgba(255,255,255, 0.5)',
          }}
        >
          {time}
        </span>
        <span style={{ userSelect: 'text', fontSize: '13px' }}>{name}</span>
      </div>
    );
  }
}

// eslint-disable-next-line
class DevTool extends React.PureComponent {
  static defaultProps = {
    keyCode: 'd',
  };

  constructor(props) {
    super(props);

    // eslint-disable-next-line
    console.log(
      `%creact-wit: In develop-mode, use [ Ctrl + ${this.props.keyCode} ] open the DevTools`,
      `padding: 1px 2px; background: rgb(70, 70, 70); color: rgb(240, 235, 200); width:100%;`,
    );

    this.state = {
      isShow: false,
      reload: 0,
      selectedIndex: 0,
      buttonHover: false,
    };
  }

  componentDidMount() {
    const { observer, keyCode } = this.props;

    const oldOnKeyPress = document.onkeypress;

    // 注册ctrl+j打开 devTool
    document.onkeypress = e => {
      if (oldOnKeyPress) {
        oldOnKeyPress(e);
      }
      if (e.ctrlKey && e.key === keyCode) {
        this.changeShow();
      }
    };

    // 先不使用摇一摇
    // shakePhone(this.changeShow);

    observer.devHook = () => {
      if (this.state.isShow) {
        this.setState(({ reload }) => {
          return {
            reload: reload + 1,
          };
        });
      }
    };
  }

  changeShow = () => {
    this.setState(({ isShow }) => {
      return {
        isShow: !isShow,
      };
    });
  };

  handleSelected = i => {
    this.setState({
      selectedIndex: i,
    });
  };

  handleOnButtonMouseEnter = () => {
    this.setState({
      buttonHover: true,
    });
  };

  handleOnButtonMouseLeave = () => {
    this.setState({
      buttonHover: false,
    });
  };

  handleRollBack = () => {
    const { observer } = this.props;
    const { selectedIndex } = this.state;
    const data = observer.devHistory[selectedIndex] || {};

    observer.rollback(data.id);
    this.setState({
      selectedIndex: observer.devHistory.length - 1,
    });
  };

  // 阻止事件冒泡
  handleStopPropagation = e => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
  };

  render() {
    const { observer } = this.props;
    const { isShow, selectedIndex, buttonHover } = this.state;

    const data = observer.devHistory[selectedIndex] || {};

    return (
      <div
        style={{
          transition: isShow ? 'transform 0s ease-out' : 'transform 0s ease-out 0.4s',
          position: 'fixed',
          pointerEvents: isShow ? 'auto' : 'none',
          left: 0,
          top: 0,
          transform: isShow ? 'translateX(0px)' : 'translateX(-2000px)',
          zIndex: 9999,
          height: '100vh',
          width: '100vw',
        }}
      >
        <div
          style={{
            transition: 'background-color 0.35s ease-out',
            backgroundColor: isShow ? 'rgba(0,0,66,0.3)' : 'rgba(0,0,66,0)',
            flexDirection: 'row',
            padding: '20px',
            overflow: 'hidden',
          }}
          onClick={this.changeShow}
        >
          <div
            style={{
              transition: 'all 0.22s ease-in-out',
              display: 'flex',
              backgroundColor: '#333335',
              height: 'calc(100vh - 40px)',
              borderRadius: '6px',
              color: '#f2f2f2',
              transform: isShow ? 'translateX(0px)' : 'translateX(100vw)',
            }}
            onClick={this.handleStopPropagation}
          >
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: '220px',
                borderRight: '1px solid rgba(0,0,0,0.3)',
                overflow: 'auto',
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  cursor: 'pointer',
                  paddingLeft: '10px',
                  height: '40px',
                  lineHeight: '40px',
                  backgroundColor: '#333335',
                  borderBottom: '1px solid rgba(0,0,0,0.3)',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: '',
                  fontSize: '11px',
                  borderTopLeftRadius: '6px',
                }}
              >
                Wit Dev Tool
              </div>
              {observer.devHistory.map((v, i) => {
                return (
                  <Item
                    num={i}
                    observer={observer}
                    selected={i === selectedIndex}
                    key={v.id}
                    onClick={() => this.handleSelected(i)}
                    {...v}
                  />
                );
              })}
            </div>
            <div
              style={{
                flex: 3.2,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflow: 'auto',
                // justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  position: 'sticky',
                  top: '0px',
                  left: '0px',
                  cursor: 'pointer',
                  paddingLeft: '10px',
                  height: '40px',
                  lineHeight: '40px',
                  borderBottom: '1px solid rgba(0,0,0,0.3)',
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: '',
                  fontSize: '11px',
                  borderTopRightRadius: '6px',
                  width: '100%',
                  backgroundColor: '#333335',
                }}
              >
                <div style={{ userSelect: 'text' }}>{data.name}</div>
                <div style={{ flex: 1 }} />
                <button
                  onClick={this.handleRollBack}
                  onTouchEnd={this.handleRollBack}
                  onMouseEnter={this.handleOnButtonMouseEnter}
                  onMouseLeave={this.handleOnButtonMouseLeave}
                  type="button"
                  style={{
                    borderLeft: '1px solid rgba(0,0,0,0.3)',
                    outline: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    padding: '2px 10px 2px 10px',
                    // margin: '0px 4px',
                    // borderRadius: '40px',
                    backgroundColor: buttonHover ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
                    fontSize: '11px',
                  }}
                >
                  Rollback to here
                </button>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.12)',
                  // borderBottom: '1px solid rgba(0,0,0,0.2)',
                  width: '100%',
                }}
              >
                <p
                  style={{
                    userSelect: 'text',
                    fontSize: '11px',
                    marginBottom: '8px',
                    marginRight: '8px',
                    color: 'rgba(255,255,255, 0.5)',
                  }}
                >
                  Before {data.name} value:
                </p>
                <pre>
                  <code style={{ fontSize: '13px', whiteSpace: 'pre-wrap', userSelect: 'text' }}>
                    {JSON.stringify(data.lastValue, null, 2)}
                  </code>
                </pre>
              </div>
              <div
                style={{
                  padding: '0px 20px 20px',
                  backgroundColor: 'rgba(0,0,0,0.12)',
                  borderBottom: '1px solid rgba(0,0,0,0.2)',
                  width: '100%',
                }}
              >
                <p
                  style={{
                    userSelect: 'text',
                    fontSize: '11px',
                    marginBottom: '8px',
                    marginRight: '8px',
                    color: 'rgba(255,255,255, 0.5)',
                  }}
                >
                  The action {data.name} value:
                </p>
                <pre>
                  <code style={{ fontSize: '13px', whiteSpace: 'pre-wrap', userSelect: 'text' }}>
                    {JSON.stringify(data.value, null, 2)}
                  </code>
                </pre>
              </div>

              <div
                style={{
                  marginTop: '1px',
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.12)',
                  borderBottom: '1px solid rgba(0,0,0,0.2)',
                  width: '100%',
                }}
              >
                <p
                  style={{
                    userSelect: 'text',
                    fontSize: '11px',
                    marginBottom: '8px',
                    marginRight: '8px',
                    color: 'rgba(255,255,255, 0.5)',
                  }}
                >
                  End all values:
                </p>
                <pre>
                  <code style={{ fontSize: '13px', whiteSpace: 'pre-wrap', userSelect: 'text' }}>
                    {JSON.stringify(data.values, null, 2)}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default (observer, keyCode) => {
  const box = document.createElement('div');

  document.body.appendChild(box);

  render(<DevTool keyCode={keyCode} observer={observer} />, box);
};
