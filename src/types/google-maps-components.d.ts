// TypeScript declarations for Google Maps Web Components
declare namespace JSX {
  interface IntrinsicElements {
    'gmp-map': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      center?: string;
      zoom?: string | number;
      'map-id'?: string;
      'gesture-handling'?: string;
      'disable-default-ui'?: boolean;
      'zoom-control'?: boolean;
    };

    'gmp-advanced-marker': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      position?: string;
      title?: string;
      'z-index'?: number;
    };
  }
}

export {};
