package com.assetmanagement.security;

import com.assetmanagement.entity.Role;
import com.assetmanagement.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final String fullName;
    private final String email;
    private final Role role;
    private final Long baseId;
    private final String baseName;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long id, String username, String password, String fullName, 
                             String email, Role role, Long baseId, String baseName,
                             Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.baseId = baseId;
        this.baseName = baseName;
        this.authorities = authorities;
    }

    public static CustomUserDetails build(User user) {
        String authority = "ROLE_" + user.getRole().name();
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(authority));

        Long baseId = (user.getBase() != null) ? user.getBase().getId() : null;
        String baseName = (user.getBase() != null) ? user.getBase().getName() : null;

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                baseId,
                baseName,
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public Long getBaseId() {
        return baseId;
    }

    public String getBaseName() {
        return baseName;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
