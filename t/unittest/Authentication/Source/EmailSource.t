#!/usr/bin/perl

=head1 NAME

EmailSource

=head1 DESCRIPTION

unit test for EmailSource

=cut

use strict;
use warnings;
#
use lib '/usr/local/pf/lib';

BEGIN {
    #include test libs
    use lib qw(/usr/local/pf/t);
    #Module for overriding configuration paths
    use setup_test_config;
}

our @TESTS = (
    {
        name => 'email',
        allowed => [qw(j@bob.com)],
        banned => [qw(j@bbob.com j@bobby.com)],
    },
    {
        name => 'email2',
        allowed => [qw(j@zozz.com)],
        banned => [qw(j@zoz.com)],
    },
    {
        name => 'email3',
        allowed => [qw(j@zozz.com j@zoz.com)],
    },
    {
        name => 'email4',
        allowed => [qw(j@bob.com j@bbob.com)],
        banned => [qw(j@zoz.com j@bob.comm)],
    },
);

use Test::More;
use pf::authentication;

#This test will running last
use Test::NoWarnings;
use List::Util qw(sum);

my $tests = sum 1, map { ( scalar @{$_->{allowed} // []}, scalar @{$_->{banned} // []}) } @TESTS;

plan tests => $tests;

for my $test (@TESTS) {
    my $source = getAuthenticationSource($test->{name});
    for my $e (@{$test->{allowed} // []}) {
        ok($source->isEmailAllowed($e), "Email ($e) is allowed");
    }

    for my $e (@{$test->{banned} // []}) {
        ok(!$source->isEmailAllowed($e), "Email ($e) is banned");
    }
}

=head1 AUTHOR

Inverse inc. <info@inverse.ca>

=head1 COPYRIGHT

Copyright (C) 2005-2018 Inverse inc.

=head1 LICENSE

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
USA.

=cut

1;

