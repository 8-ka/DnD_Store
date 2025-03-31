interface TelegramWebApp {
  WebApp: {
    ready: () => void;
    expand: () => void;
    close: () => void;
    MainButton: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      show: () => void;
      hide: () => void;
      setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    BackButton: {
      isVisible: boolean;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    themeParams: {
      bg_color: string;
      text_color: string;
      hint_color: string;
      link_color: string;
      button_color: string;
      button_text_color: string;
      secondary_bg_color: string;
    };
    ColorScheme: 'light' | 'dark';
    colorScheme: 'light' | 'dark';
    backgroundColor: string;
    headerColor: string;
    initData: string;
    initDataUnsafe: object;
    isClosingConfirmationEnabled: boolean;
    sendData: (data: string) => void;
    openLink: (url: string) => void;
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
    showPopup: (params: { title?: string; message: string; buttons?: Array<{ id: string; type?: string; text: string }> }, callback: (buttonId: string) => void) => void;
  };
}

interface Window {
  Telegram: TelegramWebApp;
} 