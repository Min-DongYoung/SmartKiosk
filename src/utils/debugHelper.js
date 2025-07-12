import { LogBox } from 'react-native';

// 특정 경고 무시 (필요한 경우)
export const ignoreWarnings = () => {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'removeListeners',
    'Non-serializable values were found in the navigation state',
  ]);
};

// 전역 에러 핸들러
export const setupGlobalErrorHandler = () => {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      // Text 렌더링 에러 디버깅
      if (args[0].includes('Text strings must be rendered within a <Text> component')) {
        console.log('=== Text 렌더링 에러 발생 위치 ===');
        console.log('Stack trace:', new Error().stack);
        console.log('Arguments:', args);
        console.log('================================');
      }
      
      // NativeEventEmitter 경고는 무시
      if (args[0].includes('NativeEventEmitter')) {
        return;
      }
    }
    
    originalConsoleError.apply(console, args);
  };
};

// 컴포넌트 트리 검사
export const inspectComponentTree = (component) => {
  console.log('=== 컴포넌트 트리 검사 ===');
  console.log('Component type:', component.type);
  console.log('Component props:', component.props);
  
  if (component.props && component.props.children) {
    React.Children.forEach(component.props.children, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        console.warn('텍스트 발견:', child);
      }
    });
  }
};