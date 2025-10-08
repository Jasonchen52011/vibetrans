/**
 * Simplified MDX components without fumadocs dependency
 */

export function getMDXComponents() {
  return {
    // Basic HTML elements
    h1: (props: any) => <h1 {...props} />,
    h2: (props: any) => <h2 {...props} />,
    h3: (props: any) => <h3 {...props} />,
    p: (props: any) => <p {...props} />,
    ul: (props: any) => <ul {...props} />,
    ol: (props: any) => <ol {...props} />,
    li: (props: any) => <li {...props} />,
    code: (props: any) => <code {...props} />,
    pre: (props: any) => <pre {...props} />,
    a: (props: any) => <a {...props} />,
  };
}
