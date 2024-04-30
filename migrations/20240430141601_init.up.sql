-- Add up migration script here
create table users(
    email varchar not null primary key,
    username varchar not null unique,
    user_bio varchar,
    user_DOB varchar not null,
    password varchar not null,
    phone_number int unique,
    photo varchar,
    user_browser varchar not null,
    user_city varchar not null,
    user_street varchar not null,
    user_lang varchar not null,
    user_time_zone varchar not null,
    user_postal_code int not null,
    user_lat_long varchar,
    user_country varchar,
    ip_address varchar not null unique,
    last_time_loggedin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    communities varchar[],
    friends varchar[]
);
create index user_idx on users (email);

-- communities table
create table communities(
    creator_email varchar not null, 
    community_name varchar not null primary key,
    community_description varchar,
    community_tags varchar[],
    community_photo varchar,
    public boolean,
    members varchar[]
);
create index community_idx on communities (community_name);
