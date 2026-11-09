-- Up Migration
CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE links (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code         VARCHAR(30)  NOT NULL UNIQUE,
  original_url TEXT         NOT NULL,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE clicks (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  link_id    INTEGER     NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer   TEXT,
  device     VARCHAR(20),
  browser    VARCHAR(50)
);

CREATE INDEX idx_links_user_id ON links (user_id);
CREATE INDEX idx_clicks_link_id_clicked_at ON clicks (link_id, clicked_at);

-- Down Migration
DROP TABLE clicks;
DROP TABLE links;
DROP TABLE users;