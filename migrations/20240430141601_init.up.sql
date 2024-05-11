-- Add up migration script here
create table users(
    email varchar not null primary key,
    email_verified boolean DEFAULT FALSE,
    username varchar not null unique,
    provider varchar not null,
    user_bio varchar,
    access_token varchar,
    refresh_token varchar,
    user_DOB varchar,
    password varchar not null,
    phone_number varchar(15),
    photo varchar,
    user_browser varchar not null,
    user_city varchar,
    user_street varchar,
    user_lang varchar,
    user_time_zone varchar,
    user_postal_code int,
    user_lat_long varchar,
    user_country varchar,
    ip_address varchar unique,
    last_time_loggedin TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    communities varchar[],
    interest varchar[],
    friends varchar[]
);
create index user_idx on users (email);

-- communities table
create table communities(
    creator_email varchar not null, 
    community_name varchar not null primary key,
    community_description varchar,
    communty_location varchar,
    community_tags varchar[],
    community_photo varchar,
    privacy boolean default false,
    members varchar[]
);
create index community_idx on communities (community_name);

-- events table
create table events(
    id varchar primary key,
    host varchar not null,
    creator_email varchar not null, 
    title varchar not null,
    sub_title varchar,
    description varchar,
    event_tags varchar[],
    event_photo varchar,
    likes varchar[],
    comments varchar[],
    date varchar,
    starting_time varchar,
    event_location varchar,
    attendees varchar[],
    privacy boolean default false
);
create index events_idx on events (title);
