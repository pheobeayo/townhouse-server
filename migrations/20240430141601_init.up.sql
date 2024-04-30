-- Add up migration script here
create table users(
    email varchar not null primary key,
    username varchar not null primary key,
    password varchar not null,
    phone_number int unique,
    photo varchar,
    user_browser varchar not null,
    ip_address varchar not null unique,
    last_time_loggedin varchar not null,
    communities varchar[],
    friends varchar[]
);
create index user_idx on users (email);

-- communities table
create table communities(
    owner_email varchar not null, 
    community_name varchar not null primary key,
    community_description varchar,
    community_tags varchar[],
    community_photo varchar,
    public boolean,
    members varchar[]
);
create index community_idx on communites (community_name);
