const config = {
    kit: {
      adapter: adapter(),
      paths: {
        base: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
      }
    }
  };